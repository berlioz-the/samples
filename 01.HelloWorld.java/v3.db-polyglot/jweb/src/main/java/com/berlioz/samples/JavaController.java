package com.berlioz.samples;

import com.berlioz.Berlioz;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
public class JavaController {

    @RequestMapping("/index-java")
    public String index(Map<String, Object> model) {
        model.put("heading", "Java App Service");

        PhoneEntry[] entries = Berlioz.service("japp").request()
                .getForObject("/entries", PhoneEntry[].class);

        model.put("entries", entries);

        return "address-book";
    }

}