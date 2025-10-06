package com.br.fasipe.compras.config;

import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.ServerSocket;

@Component
public class PortConfigurationCustomizer implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {

    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        int port = findAvailablePort();
        factory.setPort(port);
        System.out.println("===========================================");
        System.out.println("🚀 FASICLIN COMPRAS - SISTEMA INICIADO");
        System.out.println("🌐 Aplicação disponível em: http://localhost:" + port);
        System.out.println("📋 Interface: http://localhost:" + port + "/aprovacao.html");
        System.out.println("🔧 API Base: http://localhost:" + port + "/api/");
        System.out.println("===========================================");
    }

    private int findAvailablePort() {
        int[] ports = {8080, 8081, 8082, 8083, 8084, 8085, 8086, 8087, 8088, 8089};
        
        for (int port : ports) {
            if (isPortAvailable(port)) {
                System.out.println("✅ Porta " + port + " disponível - usando esta porta");
                return port;
            } else {
                System.out.println("⚠️ Porta " + port + " ocupada - testando próxima...");
            }
        }
        
        // Se nenhuma porta da lista estiver disponível, encontrar uma automática
        try (ServerSocket socket = new ServerSocket(0)) {
            int availablePort = socket.getLocalPort();
            System.out.println("🔍 Usando porta automática: " + availablePort);
            return availablePort;
        } catch (IOException e) {
            System.err.println("❌ Erro ao encontrar porta disponível, usando padrão 8080");
            return 8080;
        }
    }

    private boolean isPortAvailable(int port) {
        try (ServerSocket socket = new ServerSocket(port)) {
            socket.setReuseAddress(true);
            return true;
        } catch (IOException e) {
            return false;
        }
    }
}