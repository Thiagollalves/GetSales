import ContactDetailClient from "@/components/dashboard/contacts/contact-detail-client"

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{
    contactId: string
  }>
}) {
  const { contactId } = await params

  return <ContactDetailClient contactId={contactId} />
}
