'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createPost, createMaterial, createAssignment, gradeSubmission, markAttendance, enterExamMarks } from '@/actions/teacher.actions';
import { submitAssignment } from '@/actions/student.actions';
import { formatDate } from '@/lib/utils';

type Workspace = NonNullable<Awaited<ReturnType<typeof import('@/actions/teacher.actions').getClassWorkspace>>>;

export function ClassWorkspaceTabs({
  classId,
  data,
  mode,
}: {
  classId: string;
  data: Workspace;
  mode: 'teacher' | 'student' | 'parent';
}) {
  const readOnly = mode !== 'teacher';

  return (
    <Tabs defaultValue="stream">
      <TabsList>
        <TabsTrigger value="stream">Stream</TabsTrigger>
        <TabsTrigger value="classwork">Classwork</TabsTrigger>
        <TabsTrigger value="people">People</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
        <TabsTrigger value="marks">Marks</TabsTrigger>
      </TabsList>

      <TabsContent value="stream">
        {!readOnly && (
          <form action={createPost} className="mb-4 space-y-2 rounded-xl border p-4">
            <input type="hidden" name="classId" value={classId} />
            <Input name="title" placeholder="Announcement title" required />
            <Textarea name="description" placeholder="Write an update..." required />
            <Button type="submit">Post</Button>
          </form>
        )}
        <div className="space-y-3">
          {data.posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle className="text-base">{post.title}</CardTitle>
                <p className="text-xs text-[var(--muted)]">{post.author.name} · {formatDate(post.createdAt)}</p>
              </CardHeader>
              <CardContent><p>{post.description}</p></CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="classwork">
        {!readOnly && (
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <form action={createMaterial} className="space-y-2 rounded-xl border p-4">
              <input type="hidden" name="classId" value={classId} />
              <Input name="title" placeholder="Material title" required />
              <Input name="fileUrl" placeholder="File URL" />
              <Button type="submit" size="sm">Add Material</Button>
            </form>
            <form action={createAssignment} className="space-y-2 rounded-xl border p-4">
              <input type="hidden" name="classId" value={classId} />
              <Input name="title" placeholder="Assignment title" required />
              <Textarea name="instructions" placeholder="Instructions" required />
              <Input name="deadline" type="datetime-local" required />
              <Button type="submit" size="sm">Create Assignment</Button>
            </form>
          </div>
        )}
        <div className="space-y-3">
          {data.materials.map((m) => (
            <Card key={m.id}>
              <CardContent className="pt-4">
                <div className="font-medium">{m.title}</div>
                {m.fileUrl && <a href={m.fileUrl} className="text-sm text-[var(--cyan)]">Download</a>}
              </CardContent>
            </Card>
          ))}
          {data.assignments.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <CardTitle className="text-base">{a.title}</CardTitle>
                <p className="text-xs text-[var(--muted)]">Due {formatDate(a.deadline)}</p>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{a.instructions}</p>
                {mode === 'student' && (
                  <form action={submitAssignment} className="flex gap-2">
                    <input type="hidden" name="assignmentId" value={a.id} />
                    <Input name="fileUrl" placeholder="Submission file URL" />
                    <Button type="submit" size="sm">Submit</Button>
                  </form>
                )}
                {mode === 'teacher' && a.submissions.map((s) => (
                  <form key={s.id} action={gradeSubmission} className="mt-2 flex gap-2 border-t pt-2">
                    <input type="hidden" name="id" value={s.id} />
                    <Badge variant="secondary">{s.status}</Badge>
                    <Input name="grade" type="number" placeholder="Grade" step="0.5" />
                    <Input name="comment" placeholder="Comment" />
                    <Button type="submit" size="sm">Grade</Button>
                  </form>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="people">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Students</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data.students.map((s) => (
                <div key={s.id} className="flex justify-between text-sm">
                  <span>{s.user.name}</span>
                  <span className="text-[var(--muted)]">{s.rollNumber}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Teachers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data.subjects.filter((cs) => cs.teacher).map((cs) => (
                <div key={cs.id} className="text-sm">
                  {cs.subject.name}: {cs.teacher?.user.name}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="attendance">
        {data.locked && <Badge className="mb-3">Locked for today</Badge>}
        {mode === 'teacher' && data.isIncharge && !data.locked && data.subjects[0] && (
          <form action={markAttendance} className="space-y-3 rounded-xl border p-4">
            <input type="hidden" name="classId" value={classId} />
            <input type="hidden" name="subjectId" value={data.subjects[0].subjectId} />
            <Input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            <input
              type="hidden"
              name="records"
              value={JSON.stringify(
                data.students.map((s) => ({ studentId: s.id, status: 'PRESENT' }))
              )}
            />
            <p className="text-sm text-[var(--muted)]">Mark all present (customize via admin override)</p>
            <Button type="submit">Submit & Lock</Button>
          </form>
        )}
        {!data.isIncharge && mode === 'teacher' && (
          <p className="text-sm text-[var(--muted)]">Read-only — you are not class incharge.</p>
        )}
        <div className="mt-4 space-y-1">
          {data.attendances.slice(0, 20).map((a) => (
            <div key={a.id} className="flex justify-between text-sm border-b py-1">
              <span>{a.student.user.name}</span>
              <Badge variant={a.status === 'PRESENT' ? 'secondary' : 'destructive'}>{a.status}</Badge>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="marks">
        {mode === 'teacher' && data.exams[0] && (
          <form action={enterExamMarks} className="mb-4 flex flex-wrap gap-2 rounded-xl border p-4">
            <input type="hidden" name="examId" value={data.exams[0].id} />
            <select name="studentId" className="rounded-lg border px-2">
              {data.students.map((s) => (
                <option key={s.id} value={s.id}>{s.user.name}</option>
              ))}
            </select>
            <Input name="marksObtained" type="number" placeholder="Marks" />
            <Button type="submit" size="sm">Save</Button>
          </form>
        )}
        {data.exams.map((exam) => (
          <Card key={exam.id} className="mb-3">
            <CardHeader>
              <CardTitle className="text-base">{exam.name} — {exam.subject.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {exam.results.map((r) => (
                <div key={r.id} className="text-sm">{r.marksObtained}/{exam.totalMarks} ({r.grade})</div>
              ))}
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
