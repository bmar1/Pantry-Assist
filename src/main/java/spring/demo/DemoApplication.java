package spring.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import spring.demo.controller.AuthController;

@SpringBootApplication
public class DemoApplication {

	public static void main(String[] args) {
		//Starts server and all dependencies etc
		SpringApplication.run(DemoApplication.class, args);
		
	}

}
