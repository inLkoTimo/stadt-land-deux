"use client";

import { useState } from "react";
import { CategoryScreen } from "./game/CategoryScreen";
import { FinishedScreen } from "./game/FinishedScreen";
import { RoundScreen } from "./game/RoundScreen";
import { ScoringScreen } from "./game/ScoringScreen";
import {
  CreateScreen,
  HomeScreen,
  JoinScreen,
  LoadingScreen,
  LobbyScreen,
} from "./screens/MenuScreens";
import { useGameRoom } from "@/lib/hooks/useGameRoom";

/**
 * Verteilt nur noch auf die einzelnen Bildschirme. Die Logik
 * liegt in `useGameRoom`, die Regeln in `lib/game` - hier steht
 * bewusst nichts weiter als die Zuordnung.
 */
export function StadtLandDeuxApp() {
  const {
    screen,
    setScreen,
    game,
    state,
    playerNumber,
    isHost,
    loading,
    error,
    setError,
    actions,
  } = useGameRoom();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  if (screen === "home") {
    return (
      <HomeScreen
        onCreate={() => {
          setError("");
          setScreen("create");
        }}
        onJoin={() => {
          setError("");
          setScreen("join");
        }}
      />
    );
  }

  if (screen === "create") {
    return (
      <CreateScreen
        name={name}
        onNameChange={setName}
        onBack={() => setScreen("home")}
        onSubmit={() => void actions.createRoom(name)}
        loading={loading}
        error={error}
      />
    );
  }

  if (screen === "join") {
    return (
      <JoinScreen
        name={name}
        code={code}
        onNameChange={setName}
        onCodeChange={setCode}
        onBack={() => setScreen("home")}
        onSubmit={() => void actions.joinRoom(name, code)}
        loading={loading}
        error={error}
      />
    );
  }

  if (!game) {
    return <LoadingScreen label="Spiel wird geladen..." />;
  }

  if (screen === "lobby") {
    return (
      <LobbyScreen
        game={game}
        isHost={isHost}
        loading={loading}
        error={error}
        onStart={() => void actions.startMatch()}
        onLeave={actions.leave}
      />
    );
  }

  if (!state || !playerNumber) {
    return <LoadingScreen label="Wird vorbereitet..." />;
  }

  if (state.phase === "categories") {
    return (
      <CategoryScreen
        state={state}
        isHost={isHost}
        loading={loading}
        onAdd={(label) => void actions.addCategory(label)}
        onRemove={(label) => void actions.removeCategory(label)}
        onStart={() => void actions.startRound()}
        onLeave={actions.leave}
      />
    );
  }

  if (state.phase === "writing") {
    return (
      <RoundScreen
        game={game}
        state={state}
        me={playerNumber}
        onWriteAnswer={(category, text) =>
          void actions.writeAnswer(category, text)
        }
        onStop={() => void actions.stop()}
        onLeave={actions.leave}
      />
    );
  }

  if (state.phase === "scoring") {
    return (
      <ScoringScreen
        game={game}
        state={state}
        me={playerNumber}
        isHost={isHost}
        onToggleInvalid={(target, category) =>
          void actions.toggleAnswerInvalid(target, category)
        }
        onAdvance={() => void actions.advance()}
        onFinish={() => void actions.finish()}
        onLeave={actions.leave}
      />
    );
  }

  return (
    <FinishedScreen game={game} state={state} onLeave={actions.leave} />
  );
}
