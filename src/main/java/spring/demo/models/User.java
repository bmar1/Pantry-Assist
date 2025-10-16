package spring.demo.models;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;


import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table (name = "users")
public class User implements UserDetails {
    
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	
	@Column(unique = true, nullable = false)
    private String email;
	
    private String password; // store hashed, not plain text
    @Enumerated(EnumType.STRING)
    private Role role;

    
    private UserPreference preferences;
    
    @ElementCollection
    private List<Recipe> mealPlan = new ArrayList<>();
 
    
    
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}

	
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	@Override
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority(role.name()));
	}
	@Override
	public String getUsername() {
		return email;
	}
	public void setRole(Role userRole) {
		this.role = userRole;
		
	}
	
	
	
	public List<Recipe> getMealPlan() {
		return mealPlan;
	}
	public void setMealPlan(List<Recipe> mealPlan) {
		this.mealPlan = mealPlan;
	}
	public UserPreference getPreferences() {
		return preferences;
	}
	public void setPreferences(UserPreference preferences) {
		this.preferences = preferences;
	}
	public Role getRole() {
		return role;
	}
	
	
	

    // getters and setters
    
    
}