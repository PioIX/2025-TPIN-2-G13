"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const GameSingle = dynamic(() => import("./GameSingle"), { ssr: false });

export default function SinglePlayerPage() {
    const userId = typeof window !== 'undefined' ? sessionStorage.getItem("userId") : null;
    const [imageProfile, setImageProfile] = useState(null);

    // Opcional: cargar foto de perfil si querés
    // useEffect(() => { fetch... }, []);

    return (
        <div style={{ width: "100vw", height: "100vh", backgroundColor: "#111" }}>
            <GameSingle 
                userId={userId}
                imageProfile={imageProfile}
            />
        </div>
    );
}