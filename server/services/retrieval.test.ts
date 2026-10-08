import { describe, expect, it } from 'vitest';
import { rankChunks, type KnowledgeChunk } from './retrieval';

const chunks: KnowledgeChunk[] = [
  { sourceType: 'project', sourceId: '1', title: 'Inventory Mobile App', text: 'React Native and Firebase inventory' },
  { sourceType: 'experience', sourceId: '2', title: 'SAP Consultant', text: 'SAP S/4HANA logistics' },
  { sourceType: 'skill', sourceId: '3', title: 'React', text: 'Frontend category' },
];

describe('rankChunks', () => {
  it('menemukan project berdasarkan kata di deskripsi', () => {
    const result = rankChunks('which project uses firebase?', chunks);
    expect(result[0].sourceId).toBe('1');
  });

  it('memberi prioritas pada kecocokan judul', () => {
    const result = rankChunks('tell me about SAP', chunks);
    expect(result[0].sourceType).toBe('experience');
  });

  it('mengembalikan kosong jika tidak ada kecocokan', () => {
    expect(rankChunks('weather tomorrow', chunks)).toEqual([]);
  });
});