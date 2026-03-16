import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCreateRegulationMutation } from '@/services/api';
import { Button, Card, CardHeader, Field, Input, PageHeader } from '@/ui';
import { SearchIcon, SparkIcon } from '@/ui/icons';

const EXAMPLES = ['Kirkland, WA', 'Austin, TX', '1200 Pine St, Seattle, WA', 'Maricopa County, AZ'];

/**
 * Asks RegAdvisor AI a new question.
 *
 * The submit used to navigate away *before* the request was sent and then fire
 * two "refresh" toggles a second apart, on the theory that one of them would
 * land after the backend had written the row. It now waits for the create to
 * return and lets the `Regulation` cache tag refresh the list.
 */
const RegulationDetail: React.FC = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [createRegulation, { isLoading }] = useCreateRegulationMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const search = value.trim();

    if (!search) {
      setError('Enter a city, address or area.');
      return;
    }
    setError(null);

    try {
      await createRegulation({ search }).unwrap();
      toast.success('Question submitted. RegAdvisor AI is researching it.');
      navigate('/regulations');
    } catch {
      setError('The question could not be submitted. Try again in a moment.');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="New regulation search"
        description="Ask whether an area permits short-term rentals. The answer is saved and can be followed up on."
        breadcrumbs={[
          { name: 'Home', path: '/dashboard' },
          { name: 'Regulations', path: '/regulations' },
          { name: 'New search' },
        ]}
      />

      <Card className="max-w-2xl">
        <CardHeader
          title="Where are you looking?"
          description="A city and state is usually enough; a full address narrows it further."
        />

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <Field
            label="City, address or area"
            required
            error={error}
            hint="Research runs in the background and takes a minute or two."
          >
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Kirkland, WA"
              autoFocus
            />
          </Field>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-subtle">
              Examples
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setValue(example)}
                  className="rounded-full border border-line px-3 py-1 text-xs text-ink-muted transition-colors hover:border-line-strong hover:bg-surface-sunken"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button type="submit" loading={isLoading} icon={<SearchIcon className="h-4 w-4" />}>
              Ask RegAdvisor AI
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/regulations')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      <Card className="max-w-2xl bg-surface-sunken">
        <p className="flex items-start gap-2.5 text-sm text-ink-muted">
          <SparkIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          RegAdvisor AI summarises published rules. It is a starting point for diligence, not legal
          advice — confirm anything you are going to act on with the local authority.
        </p>
      </Card>
    </div>
  );
};

export default RegulationDetail;
