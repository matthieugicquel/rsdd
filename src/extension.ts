import * as vscode from "vscode";

const Counts: number[] = [];

export function activate(context: vscode.ExtensionContext) {
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    10,
  );
  context.subscriptions.push(statusBar);

  statusBar.name = "Squiggles average";
  statusBar.tooltip =
    "Average number of squiggles per save since last reload of VS Code";

  let previousAvg = 0;

  const updateStatusBar = () => {
    console.log("current counts", Counts);
    const avg = Math.round(average(Counts) * 10) / 10;

    const getIcon = () => {
      if (avg > previousAvg) {
        return "arrow-up";
      } else if (avg < previousAvg) {
        return "arrow-down";
      } else {
        return "arrow-right";
      }
    };

    statusBar.text = `$(${getIcon()}) ${avg.toString()} squiggles`;

    previousAvg = avg;
  };

  vscode.workspace.onDidSaveTextDocument(() => {
    updateProblemCount();
    updateStatusBar();
  });

  // Initial update on activation
  updateStatusBar();

  statusBar.show();
}

function updateProblemCount() {
  const allDiagnostics = vscode.languages.getDiagnostics();

  console.log("Updating problem count");

  let count = 0;
  for (const [uri, diagnostics] of allDiagnostics) {
    for (const diag of diagnostics) {
      if (
        diag.severity === vscode.DiagnosticSeverity.Error ||
        diag.severity === vscode.DiagnosticSeverity.Warning
      ) {
        count++;
      }
    }
  }

  Counts.push(count);
}

function average(nums: number[]) {
  if (nums.length === 0) {
    return 0;
  }

  let sum = 0;
  for (const num of nums) {
    sum += num;
  }
  return sum / nums.length;
}

export function deactivate() {}
