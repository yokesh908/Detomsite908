import { FormEvent, useEffect, useState } from 'react'
import { MainLayout } from '../components/Layout'
import api from '../services/api'
import { LocalTicket } from '../types/localApi'
import { getLocalSession } from '../utils/session'

export function SupportPage() {
  const session = getLocalSession()
  const [tickets, setTickets] = useState<LocalTicket[]>([])
  const [form, setForm] = useState({
    name: session?.name || '',
    email: session?.email || '',
    phone_number: '',
    category: 'order_issue',
    title: '',
    description: '',
  })
  const [message, setMessage] = useState('')

  const loadTickets = () => {
    api.get<LocalTicket[]>('/local/tickets')
      .then(response => setTickets(response.data))
      .catch(() => setTickets([]))
  }

  useEffect(loadTickets, [])

  const submitTicket = async (event: FormEvent) => {
    event.preventDefault()
    const response = await api.post<LocalTicket>('/local/tickets', form)
    setTickets(current => [response.data, ...current])
    setMessage(`Ticket ${response.data.ticket_number} created.`)
    setForm(current => ({ ...current, phone_number: '', title: '', description: '' }))
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#fff7e6] px-4 py-10">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={submitTicket} className="gold-sheen rounded-lg border-4 border-yellow-500 p-6">
            <h1 className="mb-5 text-4xl font-black text-green-950">Support ticket</h1>
            <div className="space-y-4">
              <input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="w-full rounded-lg border-2 border-yellow-600 px-4 py-3" placeholder="Name" required />
              <input value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className="w-full rounded-lg border-2 border-yellow-600 px-4 py-3" placeholder="Email" type="email" required />
              <input value={form.phone_number} onChange={event => setForm({ ...form, phone_number: event.target.value })} className="w-full rounded-lg border-2 border-yellow-600 px-4 py-3" placeholder="Phone number" required />
              <select value={form.category} onChange={event => setForm({ ...form, category: event.target.value })} className="w-full rounded-lg border-2 border-yellow-600 px-4 py-3">
                <option value="order_issue">Order issue</option>
                <option value="payment_issue">Payment issue</option>
                <option value="refund_issue">Refund issue</option>
                <option value="vendor_complaint">Vendor complaint</option>
                <option value="technical_issue">Technical issue</option>
              </select>
              <input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} className="w-full rounded-lg border-2 border-yellow-600 px-4 py-3" placeholder="Title" required />
              <textarea value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} className="min-h-32 w-full rounded-lg border-2 border-yellow-600 px-4 py-3" placeholder="Describe the issue" required />
            </div>
            <button className="gold-button mt-5 w-full rounded-lg border-2 px-4 py-3 font-black">Create ticket</button>
            {message && <p className="mt-4 rounded-lg bg-white p-3 font-bold text-green-900">{message}</p>}
          </form>

          <section className="rounded-lg border-2 border-yellow-500 bg-white p-6 shadow-md">
            <h2 className="mb-5 text-3xl font-black text-green-950">Recent tickets</h2>
            <div className="space-y-3">
              {tickets.map(ticket => (
                <div key={ticket.id} className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-black text-green-950">{ticket.ticket_number} · {ticket.title}</p>
                      <p className="text-sm font-bold text-green-800">{ticket.phone_number} · {ticket.category}</p>
                    </div>
                    <span className="h-fit rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">{ticket.status}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-green-800">{ticket.description}</p>
                </div>
              ))}
              {tickets.length === 0 && <p className="font-bold text-green-800">No tickets created yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}
