package com.emails.armazenar.controller;

import com.emails.armazenar.model.Cadastro;
import com.emails.armazenar.model.Emails;
import com.emails.armazenar.service.LoginService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class LoginController {

    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    // ----------------- Login -----------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid Cadastro dto) {
        Cadastro usuario = loginService.authenticate(dto.getLogin(), dto.getSenha());
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        } else {
            return ResponseEntity.status(401).body("Credenciais inválidas. Tente novamente.");
        }
    }

    // ----------------- Buscar emails do usuário logado -----------------
    @GetMapping("/emails/usuario")
    public ResponseEntity<List<Emails>> getEmailsUsuario(@RequestParam String login) {
        Cadastro usuario = loginService.findByLogin(login);
        if (usuario == null) return ResponseEntity.status(404).build();

        List<Emails> emails = loginService.getEmailsDoUsuario(usuario);
        return ResponseEntity.ok(emails);
    }

    @PostMapping("/emails")
    public ResponseEntity<Emails> salvarEmail(@RequestBody Emails email) {
        Cadastro remetente = loginService.findByLogin(email.getRemetente());
        if (remetente == null) return ResponseEntity.status(404).build();

        Cadastro destinatario = loginService.findByLogin(email.getDestinatario());
        if (destinatario == null) return ResponseEntity.status(404).build();

        email.setRemetente(remetente.getLogin());
        email.setUsuario(destinatario);

        email.setDataRecebida(LocalDateTime.now());

        Emails salvo = loginService.salvarEmail(email);
        return ResponseEntity.ok(salvo);
    }

    // ----------------- Atualizar status de um email -----------------
    @PutMapping("/emails/{id}/status")
    public ResponseEntity<?> atualizarStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {

        String novoStatus = body.get("status");
        if (novoStatus == null || novoStatus.isEmpty()) {
            return ResponseEntity.badRequest().body("Status não informado");
        }

        try {
            Emails atualizado = loginService.atualizarStatusEmail(id, novoStatus);
            if (atualizado == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(atualizado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Erro ao atualizar status: " + e.getMessage());
        }
    }


}
