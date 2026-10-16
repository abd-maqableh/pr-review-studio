import { ReviewStudio } from '@/components/review-studio';
export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ReviewStudio key={id} id={id} />; }
