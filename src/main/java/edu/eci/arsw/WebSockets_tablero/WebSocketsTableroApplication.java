package edu.eci.arsw.WebSockets_tablero;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Collections;

@SpringBootApplication
public class WebSocketsTableroApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(WebSocketsTableroApplication.class);
        app.setDefaultProperties(Collections.singletonMap("server.port", resolvePort()));
        app.run(args);
    }

    private static int resolvePort() {
        String[] candidates = {
                System.getenv("PORT"),
                System.getenv("SERVER_PORT"),
                System.getenv("WEBSITES_PORT")
        };
        for (String p : candidates) {
            if (p != null) {
                try {
                    return Integer.parseInt(p.trim());
                } catch (NumberFormatException ignored) {
                    // Ignore invalid number format and continue to the next candidate
                }
            }
        }
        return 8080;
    }
}
