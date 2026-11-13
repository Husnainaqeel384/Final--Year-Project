import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { LuCamera } from 'react-icons/lu';
import { changePassword, updateMe, uploadAvatar } from '../../api/authApi';
import { getErrorMessage } from '../../api/client';
import { setUser } from '../../redux/features/authSlice';
import { CURRENCIES } from '../../lib/format';
import { Card, CardHeader, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { Avatar } from '../../components/layout/Topbar';

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' };

function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const fileInput = useRef(null);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    email: user.email,
    currency: user.currency,
  });
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [saving, setSaving] = useState(false);

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const updatePassword = (event) =>
    setPasswords({ ...passwords, [event.target.name]: event.target.value });

  const submitProfile = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      dispatch(setUser(await updateMe(form)));
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('The new passwords do not match.');
      return;
    }
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords(EMPTY_PASSWORDS);
      toast.success('Password changed.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const changeAvatar = async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      dispatch(setUser(await uploadAvatar(file)));
      toast.success('Photo updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <title>Profile — Budget Book</title>
      <PageHeader title="Profile" subtitle="Manage your account details." />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Your details" />
          <div className="flex items-center gap-4 px-5 pt-5">
            <Avatar user={user} className="size-16 text-lg" />
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label="Profile photo" onChange={changeAvatar} />
            <Button variant="secondary" size="sm" onClick={() => fileInput.current.click()}>
              <LuCamera className="size-3.5" aria-hidden="true" /> Change photo
            </Button>
          </div>
          <form onSubmit={submitProfile} className="grid gap-4 p-5 sm:grid-cols-2">
            <Input label="First name" name="firstName" required maxLength={50} value={form.firstName} onChange={update} />
            <Input label="Last name" name="lastName" required maxLength={50} value={form.lastName} onChange={update} />
            <Input label="Username" name="username" required minLength={3} maxLength={30} value={form.username} onChange={update} />
            <Input label="Email" name="email" type="email" required value={form.email} onChange={update} />
            <Select label="Currency" name="currency" value={form.currency} onChange={update}>
              {CURRENCIES.map((code) => (
                <option key={code}>{code}</option>
              ))}
            </Select>
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit" loading={saving}>Save changes</Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Change password" />
          <form onSubmit={submitPassword} className="space-y-4 p-5">
            <Input label="Current password" name="currentPassword" type="password" autoComplete="current-password" required value={passwords.currentPassword} onChange={updatePassword} />
            <Input label="New password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} value={passwords.newPassword} onChange={updatePassword} />
            <Input label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required value={passwords.confirmPassword} onChange={updatePassword} />
            <Button type="submit" className="w-full">Change password</Button>
          </form>
        </Card>
      </div>
    </>
  );
}

export default Profile;
