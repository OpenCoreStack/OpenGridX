import type { ComponentType } from 'react';
import Basic from './scenarios/Basic';
import Flex from './scenarios/Flex';
import Grouping from './scenarios/Grouping';
import Editing from './scenarios/Editing';
import Range from './scenarios/Range';

// React 18 runs the scenarios most sensitive to the JSX runtime and React APIs; the rest are
// React-version independent and covered by the React 19 fixture.
const scenarios: Record<string, ComponentType> = {
  basic: Basic,
  flex: Flex,
  grouping: Grouping,
  editing: Editing,
  range: Range,
};

export default function App() {
  const name = new URLSearchParams(window.location.search).get('scenario') ?? '';
  const Scenario = scenarios[name];
  if (!Scenario) {
    return (
      <ul>
        {Object.keys(scenarios).map((k) => (
          <li key={k}><a href={`?scenario=${k}`}>{k}</a></li>
        ))}
      </ul>
    );
  }
  return <Scenario />;
}
