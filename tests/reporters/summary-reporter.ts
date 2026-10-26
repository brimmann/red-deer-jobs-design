import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestResult,
} from "@playwright/test/reporter"

class SummaryReporter implements Reporter {
  private passed = 0
  private failed = 0
  private skipped = 0
  private failures: { title: string; reason: string }[] = []

  onBegin(_config: FullConfig, suite: TestCase) {
    void suite
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === "passed") {
      this.passed += 1
      return
    }
    if (result.status === "skipped") {
      this.skipped += 1
      return
    }
    if (result.status === "failed" || result.status === "timedOut") {
      this.failed += 1
      const reason =
        result.error?.message?.split("\n")[0]?.trim() || "Unknown failure"
      this.failures.push({
        title: `${test.parent.title} › ${test.title}`,
        reason,
      })
    }
  }

  onEnd(_result: FullResult) {
    const total = this.passed + this.failed + this.skipped
    console.log("\n========================================")
    console.log("RED DEER JOBS - AUTOMATED TEST REPORT")
    console.log("========================================")
    console.log(`Total Tests Run:  ${total}`)
    console.log(`Passed:           ${this.passed}`)
    console.log(`Failed:           ${this.failed}`)
    console.log("")
    if (this.failures.length === 0) {
      console.log("(No failures)")
    } else {
      for (const failure of this.failures) {
        console.log(`- ${failure.title}: ${failure.reason}`)
      }
    }
    console.log("========================================\n")
  }
}

export default SummaryReporter
