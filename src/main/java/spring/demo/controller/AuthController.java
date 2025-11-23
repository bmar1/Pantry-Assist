/*
This class covers authorization and authentication of a user, as well as basic crud on a high level, this is further filtering AFTER JWT filtering.
 */

package spring.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import spring.demo.config.security.JwtService;
import spring.demo.models.*;
import spring.demo.models.repository.UserRepository;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	
	private final UserRepository userRepository;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	@PostMapping("/signup")
	public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
		// create and save new user
		User user = new User();
		user.setEmail(request.getEmail());
		user.setPassword(passwordEncoder.encode(request.getPassword())); //encrypt password
		user.setRole(Role.USER); 
		
		//Check if user is present already (if so bad request)
		if (userRepository.findByEmail(request.getEmail()).isPresent()) {
		    return ResponseEntity.badRequest().body(new AuthResponse("Email already exists"));
		}

		userRepository.save(user);
		String token = jwtService.generateToken(user);
		return ResponseEntity.ok(new AuthResponse(token));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody AuthenticationRequest request) {

		// authenticate user credentials
		authenticationManager
				.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new UsernameNotFoundException("User not found!"));
	
		String token = jwtService.generateToken(user);
		return ResponseEntity.ok(new AuthResponse(token));

	}

	//Refreshes a USER's jwt token
	@GetMapping("/refresh")
	public ResponseEntity<AuthResponse> login(@AuthenticationPrincipal UserDetails userDetails) {

		User user = userRepository.findByEmail(userDetails.getUsername())
				.orElseThrow(() -> new UsernameNotFoundException("User not found!"));

		String token = jwtService.generateToken(user);
		return ResponseEntity.ok(new AuthResponse(token));

	}

    @DeleteMapping("/delete")
    public ResponseEntity<String> delete(@AuthenticationPrincipal UserDetails userDetails){
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        userRepository.delete(user);

        if(!userRepository.existsByEmail(email)){
            return ResponseEntity.ok("Account deleted");
        }
        else {
            return ResponseEntity.status(500).body("Failed to delete");
        }
    }


}
