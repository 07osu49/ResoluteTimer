import SwiftUI
import MessageUI

struct TimerState: Codable {
    var periods = 4, minutes = 8, period = 1
    var remaining: Double = 480
    var running = false, runningPenalty = false
    var penalties: [Double] = [0, 0, 0, 0]
    var active = [false, false, false, false]
    var last = Date()
}

@MainActor final class ClockModel: ObservableObject {
    @Published var state: TimerState
    init() {
        if let data = UserDefaults.standard.data(forKey: "clock"), let saved = try? JSONDecoder().decode(TimerState.self, from: data) { state = saved }
        else { state = TimerState() }
        advance()
    }
    func save() {
        if let data = try? JSONEncoder().encode(state) { UserDefaults.standard.set(data, forKey: "clock") }
    }
    func advance() {
        let now = Date(), delta = max(0, now.timeIntervalSince(state.last))
        let gameDelta = state.running ? min(delta, state.remaining) : 0
        let penaltyDelta = state.runningPenalty ? delta : gameDelta
        if state.running { state.remaining = max(0, state.remaining - delta) }
        for i in 0..<4 where state.active[i] { state.penalties[i] = max(0, state.penalties[i] - penaltyDelta) }
        if state.remaining == 0 { state.running = false }
        state.last = now
    }
    func change(_ action: (inout TimerState) -> Void) { advance(); action(&state); state.last = Date(); save() }
}

@main struct LacrosseTimerApp: App {
    var body: some Scene { WindowGroup { ContentView() } }
}

struct ContentView: View {
    @StateObject private var clock = ClockModel()
    @Environment(\.scenePhase) private var scenePhase
    @AppStorage("team1") private var team1 = "Team 1"
    @AppStorage("team2") private var team2 = "Team 2"
    @AppStorage("score1") private var score1 = "0"
    @AppStorage("score2") private var score2 = "0"
    @AppStorage("phone") private var phone = ""
    @State private var showMessage = false
    @State private var alertText = ""
    @State private var showAlert = false
    @State private var editingPenalty: Int?
    private let pulse = Timer.publish(every: 0.1, on: .main, in: .common).autoconnect()
    private let accent = Color(red: 0.17, green: 0.72, blue: 0.58)
    private var message: String { "Lacrosse Final Score\n\(name(team1, fallback: "Team 1")): \(score(score1))\n\(name(team2, fallback: "Team 2")): \(score(score2))" }
    private func name(_ text: String, fallback: String) -> String { let value = text.trimmingCharacters(in: .whitespacesAndNewlines); return value.isEmpty ? fallback : value }
    private func score(_ text: String) -> Int { max(0, Int(text) ?? 0) }
    private func format(_ seconds: Double) -> String { let n = Int(ceil(max(0, seconds))); return String(format: "%02d:%02d", n / 60, n % 60) }
    private func card<Content: View>(@ViewBuilder _ content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 16, content: content).padding(18).frame(maxWidth: .infinity).background(Color(uiColor: .secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 18))
    }
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                HStack { VStack(alignment: .leading) { Text("SIDELINE CONTROL").font(.caption).foregroundStyle(.secondary); Text("LACROSSE TIMER").font(.title2.bold()) }; Spacer(); Text(clock.state.running ? "RUNNING" : clock.state.remaining == 0 ? "ENDED" : "READY").font(.caption.bold()).foregroundStyle(accent) }
                card {
                    Text("GAME LENGTH · PERIODS").font(.caption.bold())
                    HStack { ForEach(1...5, id: \.self) { n in
                        Button("\(n)") { clock.change { $0.periods = n; $0.period = min($0.period, n) } }.buttonStyle(.bordered).tint(clock.state.periods == n ? accent : .gray).frame(maxWidth: .infinity)
                    } }
                    Text("GAME MINUTES · PER PERIOD").font(.caption.bold())
                    HStack { ForEach([5, 8, 12, 15], id: \.self) { n in
                        Button("\(n)") { clock.change { $0.minutes = n; $0.remaining = Double(n * 60); $0.running = false } }.buttonStyle(.bordered).tint(clock.state.minutes == n ? accent : .gray).frame(maxWidth: .infinity)
                    } }
                    Toggle(isOn: Binding(get: { clock.state.runningPenalty }, set: { value in clock.change { $0.runningPenalty = value } })) { VStack(alignment: .leading) { Text("RUNNING PENALTY").font(.subheadline.bold()); Text("Keep penalties running while game is paused").font(.caption).foregroundStyle(.secondary) } }.tint(accent)
                }
                card {
                    Text("PERIOD \(clock.state.period) / \(clock.state.periods)").font(.system(size: 32, weight: .black)).frame(maxWidth: .infinity)
                    Text(format(clock.state.remaining)).font(.system(size: 88, weight: .heavy, design: .monospaced)).minimumScaleFactor(0.5).lineLimit(1).frame(maxWidth: .infinity).foregroundStyle(clock.state.remaining == 0 ? Color.orange : Color.primary)
                    HStack {
                        Button(clock.state.running ? "Ⅱ PAUSE" : "▶ START") { clock.change { if !$0.running && $0.remaining == 0 { $0.remaining = Double($0.minutes * 60) }; $0.running.toggle() } }.buttonStyle(.borderedProminent).tint(accent).frame(maxWidth: .infinity)
                        Button("Reset") { clock.change { $0.running = false; $0.remaining = Double($0.minutes * 60) } }.buttonStyle(.bordered)
                    }.controlSize(.large)
                    HStack {
                        Button("← Previous") { move(-1) }.disabled(clock.state.period == 1)
                        Spacer()
                        Button("Next Period →") { move(1) }.disabled(clock.state.period == clock.state.periods)
                    }.font(.subheadline.bold())
                }
                HStack { Text("PENALTY MINUTES").font(.subheadline.bold()); Spacer(); Text(clock.state.runningPenalty ? "RUNNING PENALTY" : "GAME CLOCK SYNC").font(.caption2).foregroundStyle(.secondary) }
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    ForEach(0..<4, id: \.self) { i in
                        card {
                            Text("PENALTY \(i + 1)").font(.caption.bold()).foregroundStyle(.secondary)
                            Text(format(clock.state.penalties[i])).font(.system(size: 38, weight: .bold, design: .monospaced)).minimumScaleFactor(0.5).lineLimit(1).foregroundStyle(clock.state.active[i] && clock.state.penalties[i] > 0 ? Color.orange : Color.primary)
                            Text(!clock.state.active[i] ? "EMPTY" : clock.state.penalties[i] == 0 ? "COMPLETE" : clock.state.running || clock.state.runningPenalty ? "COUNTING DOWN" : "SET / PAUSED").font(.caption2).foregroundStyle(.secondary)
                            HStack {
                                Button("+ Set") { editingPenalty = i }.buttonStyle(.bordered)
                                Spacer(minLength: 0)
                                Button { clock.change { $0.penalties[i] = 0; $0.active[i] = false } } label: { Image(systemName: "arrow.counterclockwise") }.accessibilityLabel("Clear penalty \(i + 1)")
                            }
                        }
                    }
                }
                card {
                    Text("FINAL SCORE REPORT").font(.headline)
                    HStack(spacing: 12) {
                        scoreBox("TEAM 1", team: $team1, value: $score1)
                        scoreBox("TEAM 2", team: $team2, value: $score2)
                    }
                    Text("TEXT MESSAGE NUMBER").font(.caption.bold())
                    TextField("Enter phone number", text: $phone).keyboardType(.phonePad).textContentType(.telephoneNumber).textFieldStyle(.roundedBorder)
                    Text(message).font(.subheadline).textSelection(.enabled).frame(maxWidth: .infinity, alignment: .leading).padding().background(Color(uiColor: .tertiarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 10))
                    Button { compose() } label: { Label("SEND TEXT", systemImage: "message.fill").font(.headline).frame(maxWidth: .infinity) }.buttonStyle(.borderedProminent).tint(accent).controlSize(.large)
                    Text("Review and send in the message composer.").font(.caption).foregroundStyle(.secondary)
                }
            }.padding().frame(maxWidth: 700).frame(maxWidth: .infinity)
        }
        .background(Color(uiColor: .systemGroupedBackground))
        .onReceive(pulse) { _ in clock.advance() }
        .onChange(of: scenePhase) { phase in clock.advance(); clock.save(); UIApplication.shared.isIdleTimerDisabled = phase == .active }
        .onAppear { UIApplication.shared.isIdleTimerDisabled = true }
        .onDisappear { clock.save(); UIApplication.shared.isIdleTimerDisabled = false }
        .confirmationDialog("Set penalty", isPresented: Binding(get: { editingPenalty != nil }, set: { if !$0 { editingPenalty = nil } }), titleVisibility: .visible) {
            ForEach([30, 60, 120, 180], id: \.self) { seconds in Button(format(Double(seconds))) { if let i = editingPenalty { clock.change { $0.penalties[i] = Double(seconds); $0.active[i] = true } }; editingPenalty = nil } }
            Button("Cancel", role: .cancel) { editingPenalty = nil }
        }
        .sheet(isPresented: $showMessage) { MessageComposer(recipient: normalizedPhone, body: message) { result in showMessage = false; if result == .failed { alertText = "The message could not be sent. Please try again."; showAlert = true } } }
        .alert("Text message", isPresented: $showAlert) { Button("OK", role: .cancel) {} } message: { Text(alertText) }
        .toolbar { ToolbarItemGroup(placement: .keyboard) { Spacer(); Button("Done") { UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil) } } }
    }
    private func scoreBox(_ title: String, team: Binding<String>, value: Binding<String>) -> some View {
        VStack(spacing: 10) { Text(title).font(.caption.bold()).foregroundStyle(.secondary); TextField(title, text: team).textFieldStyle(.roundedBorder); TextField("0", text: value).keyboardType(.numberPad).font(.system(size: 56, weight: .bold, design: .monospaced)).multilineTextAlignment(.center).onChange(of: value.wrappedValue) { text in value.wrappedValue = String(text.filter { $0.isASCII && $0.isNumber }.prefix(4)) }; Text("SCORE").font(.caption2).foregroundStyle(.secondary) }.padding(12).frame(maxWidth: .infinity).background(Color(uiColor: .tertiarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 12))
    }
    private func move(_ offset: Int) { clock.change { $0.period = min($0.periods, max(1, $0.period + offset)); $0.running = false; $0.remaining = Double($0.minutes * 60) } }
    private var normalizedPhone: String { phone.filter { $0.isASCII && $0.isNumber || $0 == "+" } }
    private func compose() {
        let value = normalizedPhone
        let digits = value.hasPrefix("+") ? String(value.dropFirst()) : value
        guard (7...15).contains(digits.count), digits.allSatisfy({ $0.isASCII && $0.isNumber }) else { alertText = "Enter a valid phone number, including country code if needed."; showAlert = true; return }
        guard MFMessageComposeViewController.canSendText() else { alertText = "Text messaging is unavailable on this device. You can select and copy the score preview instead."; showAlert = true; return }
        showMessage = true
    }
}

struct MessageComposer: UIViewControllerRepresentable {
    let recipient: String
    let body: String
    let completion: (MessageComposeResult) -> Void
    func makeCoordinator() -> Coordinator { Coordinator(completion: completion) }
    func makeUIViewController(context: Context) -> MFMessageComposeViewController {
        let controller = MFMessageComposeViewController()
        controller.messageComposeDelegate = context.coordinator
        controller.recipients = [recipient]; controller.body = body
        return controller
    }
    func updateUIViewController(_ controller: MFMessageComposeViewController, context: Context) {}
    final class Coordinator: NSObject, MFMessageComposeViewControllerDelegate {
        let completion: (MessageComposeResult) -> Void
        init(completion: @escaping (MessageComposeResult) -> Void) { self.completion = completion }
        func messageComposeViewController(_ controller: MFMessageComposeViewController, didFinishWith result: MessageComposeResult) { completion(result) }
    }
}
