package hrms.hrms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import hrms.hrms.core.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityBeans {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityBeans(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Public Auth & Registration Endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/employers/register",
                                "/api/candidateController/register"
                        ).permitAll()

                        // 2. Public Read-Only Endpoints (Browsing jobs, cities, positions)
                        .requestMatchers(HttpMethod.GET,
                                "/api/cities/**",
                                "/api/jobPosition/**",
                                "/api/jobPost/**"
                        ).permitAll()

                        // 3. Employer-Only Endpoints
                        .requestMatchers(HttpMethod.POST, "/api/jobPost/add").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.PUT, "/api/jobPost/*/deactivate").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.POST, "/api/applications/update-status").hasRole("EMPLOYER")
                        .requestMatchers(HttpMethod.GET, "/api/applications/by-advertisement/**").hasRole("EMPLOYER")

                        // 4. JobSeeker-Only Endpoints
                        .requestMatchers(HttpMethod.POST, "/api/applications/apply").hasRole("JOBSEEKER")
                        .requestMatchers(HttpMethod.GET, "/api/applications/my-applications").hasRole("JOBSEEKER")
                        // 5. All other endpoints require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}