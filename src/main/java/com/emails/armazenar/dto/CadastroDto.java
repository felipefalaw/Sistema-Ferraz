package com.emails.armazenar.dto;

import com.emails.armazenar.model.Cadastro;

public record CadastroDto(
        Long id,
        String nome,
        String empresa,
        String funcao,
        String login,
        String senha) {

    public static CadastroDto toDto(Cadastro cadastro) {
        return new CadastroDto(
                cadastro.getId(),
                cadastro.getNome(),
                cadastro.getEmpresa(),
                cadastro.getFuncao(),
                cadastro.getLogin(),
                null
        );
    }

    public Cadastro toEntity() {
        Cadastro cadastro = new Cadastro();
        cadastro.setId(this.id);
        cadastro.setNome(this.nome);
        cadastro.setEmpresa(this.empresa);
        cadastro.setFuncao(this.funcao);
        cadastro.setLogin(this.login);
        cadastro.setSenha(this.senha);
        return cadastro;
    }

}