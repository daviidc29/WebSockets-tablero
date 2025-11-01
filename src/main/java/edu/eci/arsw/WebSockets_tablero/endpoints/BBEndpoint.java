package edu.eci.arsw.WebSockets_tablero.endpoints;

import java.io.IOException;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.springframework.stereotype.Component;

import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;

@Component
@ServerEndpoint("/bbService")
public class BBEndpoint {

    private static final Logger logger = Logger.getLogger(BBEndpoint.class.getName());
    static Queue<Session> queue = new ConcurrentLinkedQueue<>();
    Session ownSession = null;

    public void send(String msg) {
       try {
            for (Session session : queue) {
               if (!session.equals(this.ownSession)) {
                   session.getBasicRemote().sendText(msg);
               }
               logger.log(Level.INFO,"Sent: {0}", msg);
            }
        } catch (IOException e) {
            logger.log(Level.INFO, e.toString());
        }
    }

    @OnMessage
    public void processPoint(String message, Session session) {
        logger.log(Level.INFO, "Point received: {0} From session: {1}", new Object[]{message, session});
        this.send(message);
    }

    @OnOpen
    public void openConnection(Session session) {
        queue.add(session);
        this.ownSession = session;
        logger.log(Level.INFO, "Connection opened.");
        try {
            session.getBasicRemote().sendText("Connection established.");
        } catch (IOException ex) {
            logger.log(Level.SEVERE,null, ex);
        }
    }

    @OnClose
    public void closedConnection(Session session) {
        queue.remove(session);
        logger.log(Level.INFO, "Connection closed.");
    }

    @OnError
    public void error(Session session, Throwable throwable) {
        queue.remove(session);
        if (throwable != null) {
            logger.log(Level.INFO, "Connection error", throwable);
        } else {
            logger.log(Level.INFO, "Null throwable");
        }
    }
    
}
