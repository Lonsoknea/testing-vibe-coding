import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export default function QuizPage() {
  const { deckId } = useParams<{ deckId: string }>();

  return (
    <div className="text-center py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Page</h1>
      <p className="text-gray-600 mb-6">Quiz functionality coming soon!</p>
      <Link
        to={`/deck/${deckId}`}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
      >
        Back to Deck
      </Link>
    </div>
  );
}
