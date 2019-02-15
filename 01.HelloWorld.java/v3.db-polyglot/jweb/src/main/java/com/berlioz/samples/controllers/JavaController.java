package com.berlioz.samples.controllers;

import com.berlioz.samples.entities.PhoneEntry;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Controller
public class JavaController {

    @Autowired
    @Qualifier("japp")
    RestTemplate restTemplate;

    @RequestMapping("/index-java")
    public String index(Map<String, Object> model) {
        model.put("heading", "Java App Service");

        try 
        {
            PhoneEntry[] entries = restTemplate
                    .getForObject("/entries", PhoneEntry[].class);
            model.put("entries", entries);
        }
        catch(Exception ex)
        {
            model.put("error", "Error from app: " + ex.getMessage());
        }

        return "address-book";
    }

}