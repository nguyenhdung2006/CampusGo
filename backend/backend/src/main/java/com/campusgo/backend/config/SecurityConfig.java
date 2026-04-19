package com.campusgo.backend.config;

import com.campusgo.backend.entity.User;
import com.campusgo.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Configuration
public class SecurityConfig {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, UserRepository userRepository) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/auth/login", "/auth/logout", "/auth/me",
                    "/oauth2/**", "/login/**", "/users/**", "/error"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth -> oauth
                .failureHandler((request, response, ex) -> {
                    ex.printStackTrace(); // in lỗi thật ra terminal
                    String msg = URLEncoder.encode(ex.getMessage(), StandardCharsets.UTF_8);
                    response.sendRedirect(frontendUrl + "?oauthError=" + msg);
                })
                .successHandler((request, response, authentication) -> {
                    var oauthUser = (org.springframework.security.oauth2.core.user.OAuth2User) authentication.getPrincipal();
                    String email = (String) oauthUser.getAttributes().get("email");
                    String name = (String) oauthUser.getAttributes().get("name");

                    if (email != null) {
                        User user = userRepository.findByEmail(email);
                        if (user == null) {
                            user = new User();
                            user.setEmail(email);
                            user.setName(name != null ? name : email.split("@")[0]);
                            user.setRole("USER");
                            userRepository.save(user);
                        } else if ((user.getName() == null || user.getName().isBlank()) && name != null) {
                            user.setName(name);
                            userRepository.save(user);
                        }
                        request.getSession().setAttribute("USER_ID", user.getId());
                    }

                    response.sendRedirect(frontendUrl);
                })
            );

        return http.build();
    }
}