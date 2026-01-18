import { ToastProvider } from './contexts/ToastContext';
import { BoardProvider } from './contexts/BoardContext';
import { Board } from './components/Board';
import { ToastContainer } from './components/ToastContainer';

function App() {
  return (
    <ToastProvider>
      <BoardProvider>
        <Board />
        <ToastContainer />
      </BoardProvider>
    </ToastProvider>
  );
}

export default App;
