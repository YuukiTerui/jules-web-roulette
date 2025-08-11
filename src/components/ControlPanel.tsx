import React from 'react';
import { RouletteData, RouletteItem } from '../types';
import styles from '../App.module.css'; // Reuse styles for now

interface ControlPanelProps {
  roulette: RouletteData;
  newItemName: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNewItemNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddItem: () => void;
  onDeleteItem: (id: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  roulette,
  newItemName,
  onTitleChange,
  onNewItemNameChange,
  onAddItem,
  onDeleteItem,
}) => {
  return (
    <div className={styles.controlsSection}>
      <h2>コントロールパネル</h2>
      <input
        type="text"
        value={roulette.title}
        onChange={onTitleChange}
        className={styles.titleInput}
        placeholder="ルーレットのタイトル"
      />
      {roulette.items.length > 0 ? (
        <ul className={styles.itemList}>
          {roulette.items.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <button onClick={() => onDeleteItem(item.id)}>削除</button>
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
          onChange={onNewItemNameChange}
          placeholder="新しい項目"
          onKeyDown={(e) => e.key === 'Enter' && onAddItem()}
        />
        <button onClick={onAddItem}>追加</button>
      </div>
    </div>
  );
};

export default ControlPanel;
