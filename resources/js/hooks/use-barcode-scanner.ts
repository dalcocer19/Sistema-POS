import { useEffect, useRef } from 'react';

type BarcodeScannerOptions = {
    /**
     * Tiempo máximo (ms) entre pulsaciones de teclas para considerar
     * que la entrada proviene de un lector de código de barras
     * (funciona como teclado HID/wedge).
     */
    scanInterval?: number;

    /**
     * Longitud mínima del código escaneado para ser considerado válido.
     * Evita falsos positivos con escritura manual.
     */
    minLength?: number;

    /**
     * Se invoca con el código de barras completo cuando el lector
     * termina de escanear (al presionar Enter o tras una pausa).
     */
    onScan: (code: string) => void;
};

/**
 * Detecta entradas provenientes de un lector de código de barras físico.
 *
 * La mayoría de los lectores funcionan como un teclado HID "wedge":
 * escriben los caracteres casi instantáneamente (intervalos < 30 ms)
 * y finalizan con la tecla Enter. Este hook acumula esos caracteres
 * y los entrega como un código completo a `onScan`.
 */
export function useBarcodeScanner({
    scanInterval = 35,
    minLength = 4,
    onScan,
}: BarcodeScannerOptions): void {
    const bufferRef = useRef('');
    const lastCharTimeRef = useRef(0);
    const timeoutRef = useRef<number | undefined>(undefined);
    const onScanRef = useRef(onScan);

    onScanRef.current = onScan;

    useEffect(() => {
        const flush = () => {
            const code = bufferRef.current.trim();

            if (code.length >= minLength) {
                onScanRef.current(code);
            }

            bufferRef.current = '';
            lastCharTimeRef.current = 0;
            timeoutRef.current = undefined;
        };

        const scheduleFlush = () => {
            if (timeoutRef.current !== undefined) {
                window.clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = window.setTimeout(flush, scanInterval);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            // Se ignora si se mantiene pulsada una tecla modificadora.
            if (event.ctrlKey || event.altKey || event.metaKey) {
                return;
            }

            const now = Date.now();

            // Enter finaliza el escaneo de inmediato.
            if (event.key === 'Enter') {
                if (bufferRef.current.length > 0) {
                    event.preventDefault();
                    flush();
                }

                return;
            }

            // Solo se aceptan caracteres imprimibles de una sola tecla.
            if (event.key.length !== 1) {
                return;
            }

            const elapsed = lastCharTimeRef.current
                ? now - lastCharTimeRef.current
                : scanInterval;

            // Si pasó demasiado tiempo desde la última tecla, se descarta
            // el buffer anterior (evita acumular escritura manual).
            if (elapsed > scanInterval * 2) {
                bufferRef.current = '';
            }

            bufferRef.current += event.key;
            lastCharTimeRef.current = now;

            scheduleFlush();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);

            if (timeoutRef.current !== undefined) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, [scanInterval, minLength]);
}
