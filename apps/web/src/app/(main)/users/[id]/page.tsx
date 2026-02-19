import { redirect } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default function UserPage({ params }: Props) {
  redirect(`/profile/${params.id}`);
}
