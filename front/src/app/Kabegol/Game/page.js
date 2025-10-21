"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";

// Import dinámico del componente Phaser
const Game = dynamic(() => import("./Game"), { ssr: false });

export default function GamePage() {
    const searchParams = useSearchParams();
    const code_room = searchParams.get("code");

    const { socket, isConnected } = useSocket();

    if (!isConnected) return <p>Conectando al servidor...</p>;

    return (
        <div style={{ width: "100vw", height: "100vh", backgroundColor: "#111" }}>
            <Game socket={socket} code_room={code_room} />
        </div>
    );
}