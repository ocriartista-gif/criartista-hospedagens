"use client";

import { FormEvent, useState } from "react";
import { accommodations } from "@/lib/mock-data";

export function BookingArea({ accommodationId }: { accommodationId?: string }) {
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="booking-area" id="reserva">
      <div>
        <span className="eyebrow">Reserve sem intermediários</span>
        <h2>Consulte as melhores datas para você.</h2>
      </div>
      {sent ? (
        <div className="success-box">
          <strong>Solicitação registrada.</strong>
          <span>Na próxima etapa, este formulário gravará o lead no Supabase e poderá espelhar no Google Sheets.</span>
        </div>
      ) : (
        <form className="booking-form" onSubmit={submit}>
          <label>Check-in<input required type="date" name="checkIn" /></label>
          <label>Check-out<input required type="date" name="checkOut" /></label>
          <label>Hóspedes<select name="guests" defaultValue="2"><option value="1">1 hóspede</option><option value="2">2 hóspedes</option><option value="3">3 hóspedes</option><option value="4">4 hóspedes</option><option value="5">5 hóspedes</option><option value="6">6 hóspedes</option></select></label>
          <label>Acomodação<select name="accommodation" defaultValue={accommodationId ?? ""}><option value="">Qualquer opção</option>{accommodations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label>Nome<input required name="name" placeholder="Seu nome" /></label>
          <label>WhatsApp<input required name="whatsapp" placeholder="(19) 99999-9999" /></label>
          <button className="button button-primary" type="submit">Consultar</button>
        </form>
      )}
    </section>
  );
}
