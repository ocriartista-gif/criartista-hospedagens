import { AccommodationForm } from "@/components/admin/AccommodationForm";
import { createAccommodation } from "../actions";

export default function NewAccommodationPage() {
  return (
    <>
      <header className="admin-header">
        <div>
          <span className="eyebrow">Nova acomodação</span>
          <h1>Cadastrar acomodação</h1>
          <p>As informações publicadas aqui alimentam automaticamente o site.</p>
        </div>
      </header>
      <AccommodationForm action={createAccommodation} submitLabel="Criar acomodação" />
    </>
  );
}
