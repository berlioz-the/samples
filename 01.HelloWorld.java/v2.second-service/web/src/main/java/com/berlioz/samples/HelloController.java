package com.berlioz.samples;

import com.berlioz.Berlioz;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @RequestMapping("/")
    public String index() {
        String body = "Greetings from Berlioz-Web!";

        String appResponse = Berlioz.service("app").request().getForObject("/", String.class);
        body += " From App: " + appResponse;

        return body ;
    }

}