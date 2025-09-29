package com.emails.armazenar.service;

import com.emails.armazenar.dto.EmailsDto;
import com.emails.armazenar.model.Cadastro;
import com.emails.armazenar.model.Emails;
import com.emails.armazenar.repository.CadastroRepository;
import com.emails.armazenar.repository.EmailsRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmailsService {

    @Autowired
    private EmailsRepository repository;

    @Autowired
    private CadastroRepository cadastroRepository;

    public ResponseEntity<Emails> cadastrar(@Valid EmailsDto dto) {
        Emails emails = dto.toEntity();
        emails.setDataRecebida(LocalDateTime.now());

        if (dto.destinatarioId() != null) {
            Cadastro destinatario = cadastroRepository.findById(dto.destinatarioId())
                    .orElseThrow(() -> new RuntimeException("Destinatário não encontrado"));
            emails.setUsuario(destinatario);
            emails.setDestinatario(destinatario.getEmail());
        } else if (dto.destinatario() != null && !dto.destinatario().isEmpty()) {
            Cadastro destinatario = cadastroRepository.findByLogin(dto.destinatario())
                    .orElseThrow(() -> new RuntimeException("Destinatário não encontrado pelo email"));
            emails.setUsuario(destinatario);
            emails.setDestinatario(destinatario.getEmail());
        } else {
            throw new RuntimeException("Destinatário não informado");
        }


        Emails salvo = repository.save(emails);
        return ResponseEntity.ok(salvo);
    }

    public ResponseEntity<List<EmailsDto>> listarTodos() {
        List<EmailsDto> lista = repository.findAll()
                .stream()
                .map(EmailsDto::toDto)
                .toList();
        return ResponseEntity.ok(lista);
    }

    public ResponseEntity<List<EmailsDto>> buscarNovosEmails(String destinatario) {
        List<EmailsDto> novos = repository.findByDestinatarioAndStatus(destinatario, "RECEBIDO")
                .stream()
                .map(EmailsDto::toDto)
                .toList();
        return ResponseEntity.ok(novos);
    }
}
