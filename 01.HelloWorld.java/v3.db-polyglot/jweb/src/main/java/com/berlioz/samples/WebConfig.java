package com.berlioz.samples;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.view.InternalResourceViewResolver;
import org.springframework.web.servlet.view.JstlView;

@Configuration
@EnableWebMvc
@ComponentScan
public class WebConfig implements WebMvcConfigurer  {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new com.berlioz.spring.Handler());
    }

    @Bean(name = "app")
    public RestTemplate restTemplateApp() {
        return new com.berlioz.http.RestTemplateBuilder()
                .service("app")
                .build();
    }

    @Bean(name = "japp")
    public RestTemplate restTemplateJApp() {
        return new com.berlioz.http.RestTemplateBuilder()
                .service("japp")
                .build();
    }

    @Override
    public void configureViewResolvers(ViewResolverRegistry registry) {
        InternalResourceViewResolver resolver = new InternalResourceViewResolver();
        resolver.setPrefix("/WEB-INF/view/");
        resolver.setSuffix(".jsp");
        resolver.setViewClass(JstlView.class);
        registry.viewResolver(resolver);
    }
}
