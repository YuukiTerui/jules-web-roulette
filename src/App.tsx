import { useState, useEffect, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { RouletteData, RouletteItem } from './types';
import RouletteCanvas from './components/RouletteCanvas';
import SavedRoulettesModal from './components/SavedRoulettesModal';
import styles from './App.module.css';

const createNewRoulette = (title: string): RouletteData => ({
  id: crypto.randomUUID(),
  title,
  items: [],
});

function App() {
  const [roulettes, setRoulettes] = useLocalStorage<RouletteData[]>('rouletteApp-list', []);
  const [currentRouletteId, setCurrentRouletteId] = useLocalStorage<string | null>('rouletteApp-currentId', null);

  const [newItemName, setNewItemName] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<RouletteItem | null>(null);
  const [winner, setWinner] = useState<RouletteItem | null>(null);
  const [targetRotation, setTargetRotation] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (roulettes.length === 0) {
      const defaultRoulette = createNewRoulette('最初のルーレット');
      setRoulettes([defaultRoulette]);
      setCurrentRouletteId(defaultRoulette.id);
    } else if (!currentRouletteId || !roulettes.find(r => r.id === currentRouletteId)) {
      setCurrentRouletteId(roulettes[0].id);
    }
  }, [roulettes, setRoulettes, currentRouletteId, setCurrentRouletteId]);

  const currentRoulette = useMemo(() =>
    roulettes.find(r => r.id === currentRouletteId),
    [roulettes, currentRouletteId]
  );

  const updateCurrentRoulette = (updatedRoulette: RouletteData) => {
    setRoulettes(roulettes.map(r => r.id === updatedRoulette.id ? updatedRoulette : r));
  };

  const handleAddItem = () => {
    if (!currentRoulette || newItemName.trim() === '') return;
    const newItem: RouletteItem = { id: crypto.randomUUID(), name: newItemName.trim() };
    updateCurrentRoulette({ ...currentRoulette, items: [...currentRoulette.items, newItem] });
    setNewItemName('');
  };

  const handleDeleteItem = (id: string) => {
    if (!currentRoulette) return;
    updateCurrentRoulette({ ...currentRoulette, items: currentRoulette.items.filter(item => item.id !== id) });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentRoulette) return;
    updateCurrentRoulette({ ...currentRoulette, title: e.target.value });
  };

  const handleStartSpin = () => {
    if (!currentRoulette || currentRoulette.items.length < 2) {
      alert('項目を2つ以上追加してください。');
      return;
    }
    const winnerIndex = Math.floor(Math.random() * currentRoulette.items.length);
    const selectedWinner = currentRoulette.items[winnerIndex];
    setWinner(selectedWinner);

    const arcSize = 360 / currentRoulette.items.length;
    const randomOffset = (Math.random() - 0.5) * arcSize * 0.8;
    const baseRotation = 270 - (winnerIndex * arcSize) - arcSize / 2;
    const spins = 5 + Math.random() * 5;
    const finalRotation = baseRotation + (spins * 360) + randomOffset;

    setTargetRotation(finalRotation);
    setResult(null);
    setIsSpinning(true);
  };

  const handleSpinEnd = (theWinner: RouletteItem) => {
    setIsSpinning(false);
    setResult(theWinner);
  };

  // Modal handlers
  const handleSelectRoulette = (id: string) => {
    setCurrentRouletteId(id);
    setIsModalOpen(false);
  };

  const handleDeleteRoulette = (id: string) => {
    if (roulettes.length <= 1) {
      alert('最後のルーレットは削除できません。');
      return;
    }
    setRoulettes(roulettes.filter(r => r.id !== id));
  };

  const handleCreateRoulette = () => {
    const newRoulette = createNewRoulette('新しいルーレット');
    setRoulettes([...roulettes, newRoulette]);
    setCurrentRouletteId(newRoulette.id);
    setIsModalOpen(false);
  };

  if (!currentRoulette) {
    return <div>読み込み中...</div>;
  }

  return (
    <>
      <SavedRoulettesModal
        isOpen={isModalOpen}
        roulettes={roulettes}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectRoulette}
        onDelete={handleDeleteRoulette}
        onCreate={handleCreateRoulette}
      />
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>シンプル・ルーレット・メーカー</h1>
          <button onClick={() => setIsModalOpen(true)} className={styles.openModalButton}>
            保存したルーレットを開く
          </button>
        </header>

        <main className={styles.main}>
          <div className={styles.rouletteSection}>
            <RouletteCanvas
              items={currentRoulette.items}
              width={400}
              height={400}
              isSpinning={isSpinning}
              targetRotation={targetRotation}
              winner={winner}
              onSpinEnd={handleSpinEnd}
            />
            <p className={styles.resultArea} data-testid="result-area">
              {isSpinning ? '回転中...' : result ? `結果: ${result.name}` : '結果表示エリア'}
            </p>
            <button className={styles.startButton} onClick={handleStartSpin} disabled={isSpinning}>
              {isSpinning ? '...' : 'スタート'}
            </button>
          </div>

          <div className={styles.controlsSection}>
            <h2>コントロールパネル</h2>
            <input
              type="text"
              value={currentRoulette.title}
              onChange={handleTitleChange}
              className={styles.titleInput}
              placeholder="ルーレットのタイトル"
            />
            {currentRoulette.items.length > 0 ? (
              <ul className={styles.itemList}>
                {currentRoulette.items.map((item) => (
                  <li key={item.id}>
                    <span>{item.name}</span>
                    <button onClick={() => handleDeleteItem(item.id)}>削除</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.noItemsMessage}>
                項目を追加してルーレットを始めましょう！
              </p>
            )}
            <div className={styles.addItemForm}>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="新しい項目"
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <button onClick={handleAddItem}>追加</button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
