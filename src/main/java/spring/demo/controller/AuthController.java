/*
This class covers authorization and authentication of a user, as well as basic crud on a high level, this is further filtering AFTER JWT filtering.
 */

package spring.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import spring.demo.config.security.JwtService;
import spring.demo.models.*;
import spring.demo.models.repository.UserRepository;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/auth")
public class AuthController{
private final UserRepository userRepository;
private final JwtService jwtService;
private final AuthenticationManager authenticationManager;
private final PasswordEncoder passwordEncoder;


    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Check if user already exists FIRST
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new AuthResponse(null,"Email already exists"));
            }

            // Create and save new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(Role.USER);

            userRepository.save(user);
            String token = jwtService.generateToken(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponse(token, "Success!"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(null,"Registration failed. Please try again."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticationRequest request) {
        try {
            // authenticate user credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(token, "Success!"));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null,"Invalid email or password"));

        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null,"Account is disabled"));

        } catch (LockedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null,"Account is locked"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(null,"Login failed. Please try again."));
        }
    }

	//Refreshes a USER's jwt token
	@GetMapping("/refresh")
	public ResponseEntity<AuthResponse> login(@AuthenticationPrincipal UserDetails userDetails) {

		User user = userRepository.findByEmail(userDetails.getUsername())
				.orElseThrow(() -> new UsernameNotFoundException("User not found!"));

		String token = jwtService.generateToken(user);
		return ResponseEntity.ok(new AuthResponse(token, "Successfully created"));

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
