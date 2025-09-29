package com.emails.armazenar.controller;

import com.emails.armazenar.dto.EmailsDto;
import com.emails.armazenar.model.Emails;
import com.emails.armazenar.service.EmailsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RequestMapping("/emails")
@RestController
public class EmailsController {

    private final EmailsService service;

    public EmailsController(EmailsService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Emails> cadastro(@RequestBody @Valid EmailsDto dto){
        return service.cadastrar(dto);
    }

    @GetMapping
    public ResponseEntity<List<EmailsDto>> listar() {
        return service.listarTodos();
    }

    @GetMapping("/novos")
    public ResponseEntity<List<EmailsDto>> novosEmails(@RequestParam String destinatario) {
        return service.buscarNovosEmails(destinatario);
    }


}
