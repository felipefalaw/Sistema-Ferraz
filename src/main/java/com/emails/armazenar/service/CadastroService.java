package com.emails.armazenar.service;

import com.emails.armazenar.dto.CadastroDto;
import com.emails.armazenar.dto.EmailsDto;
import com.emails.armazenar.model.Cadastro;
import com.emails.armazenar.repository.CadastroRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CadastroService {

    @Autowired
    private CadastroRepository repository;
    private final PasswordEncoder passwordEncoder;

    public CadastroService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public ResponseEntity<Cadastro> cadastro(@Valid CadastroDto dto) {
        Cadastro cadastro = dto.toEntity();
        cadastro.setSenha(passwordEncoder.encode(cadastro.getSenha()));
        Cadastro salvar = repository.save(cadastro);
        return ResponseEntity.ok(salvar);
    }

    public ResponseEntity<List<CadastroDto>> listarTodos() {
        List<CadastroDto> lista = repository.findAll()
                .stream()
                .map(CadastroDto::toDto)
                .toList();
        return ResponseEntity.ok(lista);
    }
}
