import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy, seedStudy } from '../../test/renderWithStudy.tsx';
import AgreementPage from '../../modules/agreement/AgreementPage.tsx';
import DemographicsPage from '../../modules/demographics/DemographicsPage.tsx';
import { STORAGE_KEY } from './study.ts';

function storedPlan() {
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
}

describe('carrying a plan between modules', () => {
  it('shows no plan bar until something has been carried', () => {
    renderWithStudy(<AgreementPage />);
    expect(screen.queryByText(/your plan/i)).not.toBeInTheDocument();
  });

  it('carries the computed sample size into the plan and persists it', async () => {
    const user = userEvent.setup();
    renderWithStudy(<AgreementPage />);

    const carry = screen.getByRole('button', { name: /carry \d+ participants/i });
    // The offer names the number, so the user is told what they are accepting
    // rather than pressing an unlabelled "continue".
    const offered = Number(/carry (\d+)/i.exec(carry.textContent ?? '')![1]);
    await user.click(carry);

    expect(storedPlan().n).toBe(offered);
    expect(storedPlan().nSource).toBe('sample size for agreement');
    expect(screen.getByText(/is in your plan/i)).toBeInTheDocument();
  });

  it('seeds a downstream module from the stored plan', () => {
    // The whole point of stage 2: the recruitment planner should already know
    // the number rather than making the user retype it.
    seedStudy({ n: 149, nSource: 'sample size for agreement' });
    renderWithStudy(<DemographicsPage />);

    expect(screen.getByLabelText(/target sample size/i)).toHaveValue(149);
    expect(screen.getByText(/sample size for agreement/i)).toBeInTheDocument();
  });

  it('flags divergence instead of silently overwriting the plan', async () => {
    // Experimenting with a number on one page must not rewrite the saved plan
    // behind the user's back — they get told, and they choose.
    const user = userEvent.setup();
    seedStudy({ n: 149 });
    renderWithStudy(<DemographicsPage />);

    const field = screen.getByLabelText(/target sample size/i);
    await user.clear(field);
    await user.type(field, '200');

    expect(storedPlan().n).toBe(149);
    expect(screen.getByText(/this page is set to 200/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /update plan to 200/i }));
    expect(storedPlan().n).toBe(200);
  });

  it('clears the plan on request', async () => {
    const user = userEvent.setup();
    seedStudy({ n: 149 });
    renderWithStudy(<DemographicsPage />);

    await user.click(screen.getByRole('button', { name: /clear/i }));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.queryByText(/your plan/i)).not.toBeInTheDocument();
  });
});
