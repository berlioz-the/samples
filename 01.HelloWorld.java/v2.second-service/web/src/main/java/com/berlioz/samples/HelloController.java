package com.berlioz.samples;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class HelloController {

    @Autowired
    @Qualifier("app")
    RestTemplate appRestTemplate;

    @RequestMapping("/")
    public String index() {
        String body = "<h1>Greetings from Web!</h1>";
        body += "<br /><br />";
        
        try 
        {
            String appResponse = 
                appRestTemplate.getForObject("/", String.class);
            body += "<b> From App: " + appResponse  + "</b>";
        }
        catch(Exception ex)
        {
            body += "<b> ERROR calling App: " + ex.getMessage() + "</b>";
        }

        return body;
    }

}