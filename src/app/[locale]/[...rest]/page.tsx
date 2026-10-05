import { notFound } from 'next/navigation';

// Any unknown address inside a language shows the translated "not found" page.
export default function CatchAll() {
  notFound();
}
