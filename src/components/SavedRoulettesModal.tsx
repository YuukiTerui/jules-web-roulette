import React from 'react';
import { RouletteData } from '../types';
import styles from './SavedRoulettesModal.module.css';

interface SavedRoulettesModalProps {
  isOpen: boolean;
  roulettes: RouletteData[];
  onClose: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const SavedRoulettesModal: React.FC<SavedRoulettesModalProps> = ({
  isOpen,
  roulettes,
  onClose,
  onSelect,
  onDelete,
  onCreate,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>保存済みルーレット一覧</h2>
        <button onClick={onCreate} className={styles.createButton}>新しいルーレットを作成</button>
        <ul className={styles.list}>
          {roulettes.map((r) => (
            <li key={r.id} className={styles.listItem}>
              <span>{r.title} ({r.items.length}項目)</span>
              <div className={styles.buttons}>
                <button onClick={() => onSelect(r.id)}>選択</button>
                <button onClick={() => onDelete(r.id)} className={styles.deleteButton}>削除</button>
              </div>
            </li>
          ))}
        </ul>
        {roulettes.length === 0 && <p>保存されているルーレットはありません。</p>}
        <button onClick={onClose} className={styles.closeButton}>閉じる</button>
      </div>
    </div>
  );
};

export default SavedRoulettesModal;
