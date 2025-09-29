package com.emails.armazenar.controller;

import com.emails.armazenar.dto.CadastroDto;
import com.emails.armazenar.model.Cadastro;
import com.emails.armazenar.service.CadastroService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/cadastro")
@RestController
public class CadastroController {

    private final CadastroService service;

    public CadastroController(CadastroService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Cadastro> cadastro(@RequestBody @Valid CadastroDto dto){
        return service.cadastro(dto);
    }

    @GetMapping
    public ResponseEntity<List<CadastroDto>> listar() {
        return service.listarTodos();
    }
}
