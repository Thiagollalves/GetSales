import ContactDetailClient from "@/components/dashboard/contacts/contact-detail-client"

export default function ContactDetailPage({
  params,
}: {
  params: {
    contactId: string
  }
}) {
  return <ContactDetailClient contactId={params.contactId} />
}
