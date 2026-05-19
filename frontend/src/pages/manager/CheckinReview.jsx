import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

export default function CheckinReview() {
  return (
    <div>
      <PageHeader title="Check-in Review" subtitle="Compare planned vs actual and add manager comments" />
      <Card className="py-16 text-center text-slate-500">
        Team check-in reviews appear here when employees submit quarterly updates.
      </Card>
    </div>
  );
}
