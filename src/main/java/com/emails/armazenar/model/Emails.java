package com.emails.armazenar.model;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "emails")
public class Emails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String assunto;
    private String remetente;
    private String destinatario;
    private String corpo;
    private LocalDateTime dataRecebida;
    private String status;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Cadastro usuario;

    public Emails(){
    }

    public Emails(Long id, String assunto, String remetente, String destinatario, String corpo, LocalDateTime dataRecebida, String status) {
        this.id = id;
        this.assunto = assunto;
        this.remetente = remetente;
        this.destinatario = destinatario;
        this.corpo = corpo;
        this.dataRecebida = dataRecebida;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAssunto() {
        return assunto;
    }

    public void setAssunto(String assunto) {
        this.assunto = assunto;
    }

    public String getRemetente() {
        return remetente;
    }

    public void setRemetente(String remetente) {
        this.remetente = remetente;
    }

    public String getDestinatario() {
        return destinatario;
    }

    public void setDestinatario(String destinatario) {
        this.destinatario = destinatario;
    }

    public String getCorpo() {
        return corpo;
    }

    public void setCorpo(String corpo) {
        this.corpo = corpo;
    }

    public LocalDateTime getDataRecebida() {
        return dataRecebida;
    }

    public void setDataRecebida(LocalDateTime dataRecebida) {
        this.dataRecebida = dataRecebida;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Cadastro getUsuario() {
        return usuario;
    }

    public void setUsuario(Cadastro usuario) {
        this.usuario = usuario;
    }
}
