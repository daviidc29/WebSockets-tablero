package edu.eci.arsw.WebSockets_tablero.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DrawingServiceController {

    @GetMapping("/status")
    public String getStatus() {
        return "{\"status\":\"Greetings from Spring Boot "
                + java.time.LocalDate.now() + ", " 
                + java.time.LocalTime.now() 
                + ". " + "The server is running!\"}";
    }
}
