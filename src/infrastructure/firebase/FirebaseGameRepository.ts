import firebase from 'firebase/app';
import 'firebase/firestore';
import { Game as DomainGame, GameType } from '../../core/domain/entities/Game';
import { Player as DomainPlayer, PlayerStatus } from '../../core/domain/entities/Player';
import { Task as DomainTask, TaskStatus } from '../../core/domain/entities/Task';
import { IGameRepository } from '../../core/domain/repositories/IGameRepository';

import { db } from './firebase';

function mapFirestoreTaskToDomain(t: any): DomainTask {
  return new DomainTask(
    t.id,
    t.title,
    t.description,
    t.status as TaskStatus,
    t.score,
    t.taskCode,
    t.revealed
  );
}

function mapDomainTaskToFirestore(t: DomainTask): any {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    score: t.score !== undefined ? t.score : null,
    taskCode: t.taskCode !== undefined ? t.taskCode : null,
    revealed: t.revealed !== undefined ? t.revealed : false
  };
}

function mapFirestoreGameToDomain(id: string, g: any, players: DomainPlayer[]): DomainGame {
  const tasks = g.tasks ? g.tasks.map((t: any) => mapFirestoreTaskToDomain(t)) : [];

  let createdAt = new Date();
  if (g.createdAt) {
    if (typeof g.createdAt.toDate === 'function') {
      createdAt = g.createdAt.toDate();
    } else {
      createdAt = new Date(g.createdAt);
    }
  }

  let updatedAt = undefined;
  if (g.updatedAt) {
    if (typeof g.updatedAt.toDate === 'function') {
      updatedAt = g.updatedAt.toDate();
    } else {
      updatedAt = new Date(g.updatedAt);
    }
  }

  const isFinished = g.isFinished !== undefined ? g.isFinished : (g.gameStatus === 'Finished');

  return new DomainGame(
    id,
    g.name,
    isFinished,
    g.currentTaskId,
    tasks,
    players,
    g.cards || [],
    g.createdBy || '',
    g.createdById || '',
    createdAt,
    g.average || 0,
    g.gameType as GameType,
    g.isAllowMembersToManageSession,
    g.storyName,
    updatedAt,
    g.timerProps,
    g.autoReveal,
    g.moderatorIds || []
  );
}

function mapDomainGameToFirestore(g: DomainGame): any {
  return {
    id: g.id,
    name: g.name,
    isFinished: g.isFinished,
    gameStatus: g.isFinished ? 'Finished' : 'Started',
    currentTaskId: g.currentTaskId || null,
    tasks: g.tasks.map((t) => mapDomainTaskToFirestore(t)),
    cards: g.cards,
    createdBy: g.createdBy,
    createdById: g.createdById,
    createdAt: g.createdAt,
    average: g.average,
    gameType: g.gameType || null,
    isAllowMembersToManageSession: g.isAllowMembersToManageSession || false,
    storyName: g.storyName || null,
    updatedAt: new Date(),
    timerProps: g.timerProps || null,
    autoReveal: g.autoReveal || false,
    moderatorIds: g.moderatorIds || [],
  };
}

function mapFirestorePlayerToDomain(p: any): DomainPlayer {
  return new DomainPlayer(
    p.id,
    p.name,
    p.status as PlayerStatus,
    p.value,
    p.isNonVoter,
  );
}

function mapDomainPlayerToFirestore(p: DomainPlayer): any {
  return {
    id: p.id,
    name: p.name,
    status: p.status,
    value: p.value !== undefined ? p.value : null,
    isNonVoter: p.isNonVoter || false,
  };
}

export class FirebaseGameRepository implements IGameRepository {
  async getById(gameId: string): Promise<DomainGame | null> {
    const gameDoc = await db.collection('games').doc(gameId).get();
    if (!gameDoc.exists) return null;

    const playersSnap = await db.collection('games').doc(gameId).collection('players').get();
    const players: DomainPlayer[] = [];
    playersSnap.forEach((snap) => {
      players.push(mapFirestorePlayerToDomain(snap.data()));
    });

    return mapFirestoreGameToDomain(gameId, gameDoc.data(), players);
  }

  async save(game: DomainGame): Promise<void> {
    const data = mapDomainGameToFirestore(game);
    await db.collection('games').doc(game.id).set(data, { merge: true });
  }

  async delete(gameId: string): Promise<void> {
    await db.collection('games').doc(gameId).delete();
    const playersSnap = await db.collection('games').doc(gameId).collection('players').get();
    const batch = db.batch();
    playersSnap.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  streamGame(gameId: string, callback: (game: DomainGame) => void): () => void {
    return db.collection('games').doc(gameId).onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data();
        callback(mapFirestoreGameToDomain(gameId, data, []));
      }
    });
  }

  streamPlayers(gameId: string, callback: (players: DomainPlayer[]) => void): () => void {
    return db.collection('games').doc(gameId).collection('players').onSnapshot((snapshot) => {
      const playersList: DomainPlayer[] = [];
      snapshot.forEach((doc) => {
        playersList.push(mapFirestorePlayerToDomain(doc.data()));
      });
      callback(playersList);
    });
  }

  async savePlayer(gameId: string, player: DomainPlayer): Promise<void> {
    const data = mapDomainPlayerToFirestore(player);
    await db.collection('games').doc(gameId).collection('players').doc(player.id).set(data);
  }

  async removePlayer(gameId: string, playerId: string): Promise<void> {
    await db.collection('games').doc(gameId).collection('players').doc(playerId).delete();
  }
}
