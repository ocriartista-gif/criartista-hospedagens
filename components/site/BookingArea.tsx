"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Accommodation } from "@/types";
import { createClient } from "@/lib/supabase/client";

type BookingAreaProps = {
  propertyId: string;
  propertyWhatsapp: string;
  accommodations: Accommodation[];
  accommodationId?: string;
  content?: {
    eyebrow?: string;
    title?: string;
    description?: string;
  };
};

function localDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return localDateValue(date);
}

export function BookingArea({
  propertyId,
  propertyWhatsapp,
  accommodations,
  accommodationId,
  content,
}: BookingAreaProps) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [checkInValue, setCheckInValue] = useState("");
  const today = useMemo(() => localDateValue(new Date()), []);
  const minimumCheckOut = checkInValue ? nextDate(checkInValue) : today;

  const whatsappHref = useMemo(() => {
    const text = encodeURIComponent(
      summary
        ? `Olá! Vim pelo site e acabei de enviar uma consulta: ${summary}`
        : "Olá! Vim pelo site e gostaria de consultar uma estadia."
    );
    return `https://wa.me/${propertyWhatsapp}?text=${text}`;
  }, [propertyWhatsapp, summary]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setState("sending");

    const form = new FormData(event.currentTarget);
    const checkIn = String(form.get("checkIn") ?? "");
    const checkOut = String(form.get("checkOut") ?? "");
    const adults = Number(form.get("adults") ?? 2);
    const children = Number(form.get("children") ?? 0);
    const accommodation = String(form.get("accommodation") ?? "");
    const name = String(form.get("name") ?? "").trim();
    const whatsapp = String(form.get("whatsapp") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const whatsappDigits = whatsapp.replace(/\D/g, "");

    const start = new Date(`${checkIn}T12:00:00`);
    const end = new Date(`${checkOut}T12:00:00`);
    const todayDate = new Date(`${today}T00:00:00`);

    if (!checkIn || !checkOut || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError("Informe datas válidas para a estadia.");
      setState("idle");
      return;
    }

    if (start < todayDate) {
      setError("O check-in não pode estar no passado.");
      setState("idle");
      return;
    }

    if (end <= start) {
      setError("O check-out precisa ser posterior ao check-in.");
      setState("idle");
      return;
    }

    if (name.length < 2) {
      setError("Informe seu nome.");
      setState("idle");
      return;
    }

    if (whatsappDigits.length < 10 || whatsappDigits.length > 13) {
      setError("Informe um WhatsApp válido com DDD.");
      setState("idle");
      return;
    }

    const nights = Math.round(
      (end.getTime() - start.getTime()) / 86_400_000
    );

    const params = new URLSearchParams(window.location.search);
    const supabase = createClient();

    const { error: insertError } = await supabase.from("leads").insert({
      property_id: propertyId,
      name,
      whatsapp: whatsappDigits,
      email: email || null,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      adults,
      children,
      accommodation_id: accommodation || null,
      source: params.get("utm_source") ?? "site",
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
      status: "novo",
    });

    if (insertError) {
      console.error(insertError);
      setError("Não foi possível registrar sua consulta agora. Tente novamente.");
      setState("idle");
      return;
    }

    setSummary(
      `${checkIn} a ${checkOut} · ${adults} adulto(s) · ${children} criança(s)`
    );
    setState("sent");
  }

  return (
    <section className="booking-area" id="reserva">
      <div>
        <span className="eyebrow">
          {content?.eyebrow || "Reserve sem intermediários"}
        </span>
        <h2>{content?.title || "Consulte as melhores datas para você."}</h2>
        {content?.description && <p>{content.description}</p>}
      </div>

      {state === "sent" ? (
        <div className="success-box">
          <strong>Solicitação registrada.</strong>
          <span>
            Seus dados já entraram no atendimento da hospedagem. Se quiser,
            continue a conversa agora pelo WhatsApp.
          </span>
          {propertyWhatsapp && (
            <a className="button button-primary" href={whatsappHref} target="_blank" rel="noreferrer">
              Falar agora pelo WhatsApp
            </a>
          )}
        </div>
      ) : (
        <form className="booking-form" onSubmit={submit}>
          <label>
            Check-in
            <input
              required
              type="date"
              name="checkIn"
              min={today}
              value={checkInValue}
              onChange={(event) => setCheckInValue(event.target.value)}
            />
          </label>
          <label>
            Check-out
            <input required type="date" name="checkOut" min={minimumCheckOut} />
          </label>
          <label>
            Adultos
            <select name="adults" defaultValue="2">
              {[1, 2, 3, 4, 5, 6].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Crianças
            <select name="children" defaultValue="0">
              {[0, 1, 2, 3, 4].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Acomodação
            <select name="accommodation" defaultValue={accommodationId ?? ""}>
              <option value="">Qualquer opção</option>
              {accommodations.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
          <label>
            Nome
            <input required name="name" autoComplete="name" placeholder="Seu nome" />
          </label>
          <label>
            WhatsApp
            <input
              required
              name="whatsapp"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(19) 99999-9999"
            />
          </label>
          <label>
            E-mail
            <input type="email" name="email" autoComplete="email" placeholder="voce@email.com" />
          </label>
          <button
            className="button button-primary"
            type="submit"
            disabled={state === "sending"}
          >
            {state === "sending" ? "Enviando..." : "Consultar"}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
        </form>
      )}
    </section>
  );
}
