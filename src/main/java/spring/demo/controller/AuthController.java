package spring.demo.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import ch.qos.logback.core.net.SyslogOutputStream;
import lombok.RequiredArgsConstructor;
import spring.demo.config.security.JwtService;
import spring.demo.models.*;


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
		user.setPassword(passwordEncoder.encode(request.getPassword()));
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
}
