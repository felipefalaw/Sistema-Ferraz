package com.emails.armazenar.dto;

import com.emails.armazenar.model.Emails;

import java.time.LocalDateTime;

public record EmailsDto(
        Long id,
        String assunto,
        String remetente,
        String destinatario,
        Long destinatarioId,
        String corpo,
        LocalDateTime dataRecebida,
        String status) {

    public static EmailsDto toDto(Emails emails) {
        return new EmailsDto(
                emails.getId(),
                emails.getAssunto(),
                emails.getRemetente(),
                emails.getDestinatario(),
                emails.getUsuario() != null ? emails.getUsuario().getId() : null,
                emails.getCorpo(),
                emails.getDataRecebida(),
                emails.getStatus()
        );
    }

    public Emails toEntity() {
        Emails emails = new Emails();
        emails.setId(this.id);
        emails.setAssunto(this.assunto);
        emails.setRemetente(this.remetente);
        emails.setDestinatario(this.destinatario);
        emails.setCorpo(this.corpo);
        emails.setDataRecebida(this.dataRecebida);
        emails.setStatus(this.status);
        return emails;
    }
}
