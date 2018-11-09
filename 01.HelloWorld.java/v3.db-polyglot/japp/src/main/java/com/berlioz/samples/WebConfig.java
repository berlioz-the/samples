package com.berlioz.samples;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.sql.DataSource;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new com.berlioz.spring.Handler());
    }

    @Bean
    public DataSource dataSource() throws IllegalArgumentException {
        return new com.berlioz.sql.DataSourceBuilder()
                .url(dbUrl)
                .username(dbUsername)
                .password(dbPassword)
                .build();
    }

}
