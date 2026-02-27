import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Archivo de versión
const VERSION_FILE = path.join(process.cwd(), '.version.json');

interface VersionData {
  current: string;
  major: number;
  minor: number;
  patch: number;
  lastUpdate: string;
}

// Helpers para semver
function parseVersion(v: string): { major: number; minor: number; patch: number } {
  const parts = v.replace(/^v/, '').split('.');
  return {
    major: parseInt(parts[0]) || 0,
    minor: parseInt(parts[1]) || 0,
    patch: parseInt(parts[2]) || 0,
  };
}

function incrementVersion(current: string, type: 'major' | 'minor' | 'patch' = 'patch'): string {
  const v = parseVersion(current);
  if (type === 'major') v.major++, v.minor = 0, v.patch = 0;
  else if (type === 'minor') v.minor++, v.patch = 0;
  else v.patch++;
  return `${v.major}.${v.minor}.${v.patch}`;
}

async function getVersion(): Promise<VersionData> {
  try {
    const data = await fs.readFile(VERSION_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    const initial: VersionData = {
      current: '5.1.0',
      major: 5,
      minor: 1,
      patch: 0,
      lastUpdate: new Date().toISOString(),
    };
    await fs.writeFile(VERSION_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

async function saveVersion(data: VersionData): Promise<void> {
  await fs.writeFile(VERSION_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const version = await getVersion();
    return NextResponse.json({
      success: true,
      version: version.current,
      data: version,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to get version' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, type } = body;

    const current = await getVersion();

    if (action === 'increment') {
      const newVersion = incrementVersion(current.current, type || 'patch');
      const v = parseVersion(newVersion);
      const updated: VersionData = {
        current: newVersion,
        major: v.major,
        minor: v.minor,
        patch: v.patch,
        lastUpdate: new Date().toISOString(),
      };
      await saveVersion(updated);
      return NextResponse.json({
        success: true,
        oldVersion: current.current,
        newVersion: newVersion,
      });
    }

    if (action === 'reset') {
      const resetData: VersionData = {
        current: '1.0.0',
        major: 1,
        minor: 0,
        patch: 0,
        lastUpdate: new Date().toISOString(),
      };
      await saveVersion(resetData);
      return NextResponse.json({
        success: true,
        message: 'Version reset to 1.0.0',
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update version' }, { status: 500 });
  }
}
