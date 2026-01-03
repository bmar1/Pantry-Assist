package spring.demo.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String message;

    public AuthResponse(String token, String message) {
        this.message = message;
        this.token = token;
    }

    public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}
}